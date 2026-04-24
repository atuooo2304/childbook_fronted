import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type NarrativeStyle = 'daily' | 'bedtime' | 'habit' | 'special';

interface GenerateBookRequest {
  child?: {
    name?: string;
    age?: number;
    interests?: string;
  };
  input?: {
    type?: 'topic' | 'one_liner';
    value?: string;
  };
  style?: {
    styleId?: string;
  };
  role?: {
    name?: string;
    traits?: string;
  };
}

interface StoryPage {
  text: string;
  imagePrompt: string;
  imageUrl: string;
  layoutHint?: 'bottom' | 'top-left' | 'top-right' | 'centered';
  ttsText?: string;
}

interface BranchChoiceOption {
  id: 'A' | 'B';
  label: string;
}

interface RawStoryPage {
  text: string;
  imagePrompt: string;
  layoutHint: StoryPage['layoutHint'];
}

interface ExtractedStoryData {
  pages: RawStoryPage[];
  branching?: {
    branchPageIndex: number;
    choices: BranchChoiceOption[];
    paths: {
      A: RawStoryPage[];
      B: RawStoryPage[];
    };
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const promptFile = path.join(workspaceRoot, 'juqing_generator_prompt.txt');
const stylePromptFile = path.join(workspaceRoot, 'style_prompt.txt');

const basePromptTemplate = fs.existsSync(promptFile) ? fs.readFileSync(promptFile, 'utf-8') : '';
const stylePrompt = fs.existsSync(stylePromptFile) ? fs.readFileSync(stylePromptFile, 'utf-8').trim() : '';
const sanitizedStylePrompt = stylePrompt
  .replace(/in the style of[^,]*/gi, '')
  .replace(/Henri Matisse/gi, '')
  .replace(/Peter Doig/gi, '')
  .replace(/\s*,\s*,/g, ',')
  .trim();

const app = express();
const port = Number(process.env.PORT || 3001);
const deepseekBaseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, '');
const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const apimartBaseUrl = (process.env.APIMART_BASE_URL || 'https://api.apimart.ai/v1').replace(/\/+$/, '');
const apimartImageModel = process.env.APIMART_IMAGE_MODEL || 'gpt-image-2';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const getLayoutHint = (index: number): StoryPage['layoutHint'] => {
  const layouts: StoryPage['layoutHint'][] = ['bottom', 'top-left', 'top-right', 'centered'];
  return layouts[index % layouts.length];
};

const sanitizeForTts = (text: string) =>
  text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9，。！？、；：“”"'（）()\- ]/g, '')
    .trim();

const extractFirstJson = (raw: string): any => {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return JSON.parse(fenced[1]);

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
  }

  throw new Error('未从模型输出中解析到合法 JSON');
};

const inferNarrativeStyle = (inputType: 'topic' | 'one_liner', value: string): NarrativeStyle => {
  if (inputType === 'topic') {
    const v = value.toLowerCase();
    if (v.includes('sleep') || v.includes('睡')) return 'bedtime';
    if (v.includes('habit') || v.includes('习惯') || v.includes('刷牙')) return 'habit';
    if (v.includes('special') || v.includes('特别') || v.includes('生日')) return 'special';
    return 'daily';
  }
  if (/睡|晚安|夜/.test(value)) return 'bedtime';
  if (/刷牙|习惯|收拾|礼貌|勇敢/.test(value)) return 'habit';
  if (/生日|节日|第一次|特别/.test(value)) return 'special';
  return 'daily';
};

const buildStoryPrompt = (payload: GenerateBookRequest) => {
  const childName = payload.child?.name?.trim() || '小读者';
  const childAge = payload.child?.age || 5;
  const inputType = payload.input?.type || 'topic';
  const inputValue = payload.input?.value?.trim() || '神奇的森林冒险';
  const roleName = payload.role?.name?.trim() || childName;
  const narrativeStyle = inferNarrativeStyle(inputType, inputValue);

  if (!basePromptTemplate) {
    return `
你是一位儿童绘本作家。请严格输出 JSON，不要 markdown。
孩子名字：${childName}
孩子年龄：${childAge}
角色ID：${roleName}
叙事风格：${narrativeStyle}
输入类型：${inputType === 'one_liner' ? 'A' : 'B'}
家长描述：${inputType === 'one_liner' ? inputValue : ''}
灵感卡分类：${inputType === 'topic' ? narrativeStyle : ''}
请输出 6-8 页绘本，包含每页 text 与 illustration.scene/focus/elements/mood。
`;
  }

  return basePromptTemplate
    .replaceAll('[child_name]', childName)
    .replaceAll('[child_age]', String(childAge))
    .replaceAll('[character_id]', roleName)
    .replace('[家长描述]', inputType === 'one_liner' ? inputValue : '')
    .replace('[灵感卡分类]', inputType === 'topic' ? narrativeStyle : '')
    .replace('输入类型：          # 填 A 或 B', `输入类型：          # ${inputType === 'one_liner' ? 'A' : 'B'}`);
};

const toRawStoryPage = (p: any, idx: number): RawStoryPage => {
  const text = String(p?.text || '').trim();
  const scene = String(p?.illustration?.scene || '').trim();
  const imagePrompt = scene || `storybook page ${idx + 1}`;
  return {
    text,
    imagePrompt,
    layoutHint: getLayoutHint(idx),
  };
};

const extractStoryData = (storyJson: any): ExtractedStoryData => {
  if (Array.isArray(storyJson?.pages)) {
    return {
      pages: storyJson.pages.map((p: any, idx: number) => toRawStoryPage(p, idx)),
      branching: undefined,
    };
  }

  if (Array.isArray(storyJson?.main_pages) && storyJson?.branch_choice && storyJson?.branch_paths) {
    const mainPages = storyJson.main_pages.map((p: any, idx: number) => toRawStoryPage(p, idx));
    const branchChoicePage = toRawStoryPage(storyJson.branch_choice, mainPages.length);
    const pages = [...mainPages, branchChoicePage];

    const rawChoices = Array.isArray(storyJson?.branch_choice?.choices) ? storyJson.branch_choice.choices : [];
    const choices: BranchChoiceOption[] = rawChoices
      .filter((c: any) => c?.id === 'A' || c?.id === 'B')
      .map((c: any) => ({ id: c.id, label: String(c?.label || '').trim() || `选项 ${c.id}` }));

    const pathA = Array.isArray(storyJson?.branch_paths?.A)
      ? storyJson.branch_paths.A.map((p: any, idx: number) => toRawStoryPage(p, idx + pages.length))
      : [];
    const pathB = Array.isArray(storyJson?.branch_paths?.B)
      ? storyJson.branch_paths.B.map((p: any, idx: number) => toRawStoryPage(p, idx + pages.length + pathA.length))
      : [];

    return {
      pages,
      branching: {
        branchPageIndex: mainPages.length,
        choices: choices.length ? choices : [{ id: 'A', label: '继续前进' }, { id: 'B', label: '换个方式' }],
        paths: { A: pathA, B: pathB },
      },
    };
  }

  return { pages: [] as RawStoryPage[], branching: undefined };
};

const createImagePrompt = (prompt: string) =>
  `${sanitizedStylePrompt || 'childish crayon illustration style, hand-painted, warm colors, clean lines'}, ${prompt}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractImageUrlFromTaskData = (taskData: any): string | null => {
  const urlFromArray = taskData?.result?.images?.[0]?.url?.[0];
  if (typeof urlFromArray === 'string' && urlFromArray) return urlFromArray;

  const urlDirect = taskData?.result?.images?.[0]?.url;
  if (typeof urlDirect === 'string' && urlDirect) return urlDirect;

  const legacyUrl = taskData?.url;
  if (typeof legacyUrl === 'string' && legacyUrl) return legacyUrl;

  return null;
};

const pollApiMartTaskResult = async (taskId: string): Promise<string> => {
  const apiKey = process.env.APIMART_API_KEY;
  if (!apiKey) throw new Error('缺少 APIMART_API_KEY');

  const maxTries = 50;
  for (let i = 0; i < maxTries; i += 1) {
    if (i === 0) {
      // APIMart 文档建议首次查询等待 10-20 秒
      await sleep(8000);
    } else {
      await sleep(3000);
    }

    const res = await fetch(`${apimartBaseUrl}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const bodyText = await res.text();
      throw new Error(`APIMart 任务查询失败: ${res.status} ${bodyText}`);
    }

    const data = await res.json();
    const status = data?.data?.status;
    if (status === 'completed') {
      const imageUrl = extractImageUrlFromTaskData(data?.data);
      if (imageUrl) return imageUrl;
      throw new Error('APIMart 任务完成但未返回图片链接');
    }
    if (status === 'failed') {
      const reason = data?.data?.error?.message || data?.data?.error || 'unknown_error';
      throw new Error(`APIMart 出图任务失败: ${reason}`);
    }
  }

  throw new Error('APIMart 出图任务超时，请稍后重试');
};

const generateImageViaApiMart = async (prompt: string): Promise<string> => {
  const apiKey = process.env.APIMART_API_KEY;
  if (!apiKey) throw new Error('缺少 APIMART_API_KEY');

  const response = await fetch(`${apimartBaseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: apimartImageModel,
      prompt,
      size: '1024x1024',
      n: 1,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`APIMart 出图失败: ${response.status} ${bodyText}`);
  }

  const data = await response.json();
  const first = data?.data?.[0];
  if (first?.url) return first.url as string;
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json as string}`;

  if (first?.task_id) {
    return pollApiMartTaskResult(first.task_id as string);
  }

  throw new Error('APIMart 返回中未找到 url/b64_json/task_id');
};

const generateStoryJsonViaDeepSeek = async (prompt: string) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('缺少 DEEPSEEK_API_KEY');

  const response = await fetch(`${deepseekBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: deepseekModel,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: '你是儿童绘本编剧，只输出 JSON，不要 markdown 代码块，不要额外说明。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'text',
      },
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`DeepSeek 文本生成失败: ${response.status} ${bodyText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('DeepSeek 返回中未找到文本内容');
  }
  return extractFirstJson(rawText);
};

const materializePagesWithImages = async (rawPages: RawStoryPage[]) => {
  // 控制并发，避免一次性提交过多任务导致长时间 pending
  const concurrency = 2;
  const pages: StoryPage[] = new Array(rawPages.length);

  for (let i = 0; i < rawPages.length; i += concurrency) {
    const chunk = rawPages.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (raw) => {
        const fullPrompt = createImagePrompt(raw.imagePrompt);
        const imageUrl = await generateImageViaApiMart(fullPrompt);
        const page: StoryPage = {
          text: raw.text,
          ttsText: sanitizeForTts(raw.text),
          imagePrompt: fullPrompt,
          imageUrl,
          layoutHint: raw.layoutHint,
        };
        return page;
      }),
    );
    chunkResults.forEach((p, idx) => {
      pages[i + idx] = p;
    });
  }

  return pages;
};

const buildMockStory = (payload: GenerateBookRequest) => {
  const now = Date.now();
  const childName = payload.child?.name?.trim() || '小读者';
  const theme = payload.input?.value || '奇妙的一天';
  const pages: StoryPage[] = Array.from({ length: 6 }).map((_, i) => ({
    text: `${childName}在第${i + 1}页经历了一个温暖的小瞬间，故事继续向前展开。`,
    ttsText: `${childName}在第${i + 1}页经历了一个温暖的小瞬间，故事继续向前展开。`,
    imagePrompt: `storybook page ${i + 1}, ${theme}, child hero, warm light`,
    imageUrl:
      'https://images.unsplash.com/photo-1616628182509-6d2c24f3fd31?auto=format&fit=crop&w=1024&q=80',
    layoutHint: getLayoutHint(i),
  }));

  return {
    id: `mock-${now}`,
    title: `${childName}的${theme}`,
    pages,
    coverUrl: pages[0]?.imageUrl,
    createdAt: now,
    theme,
  };
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.post('/api/generate-book/mock', (req, res) => {
  const story = buildMockStory(req.body ?? {});
  res.json({
    story,
    meta: {
      durationMs: 0,
      modelText: 'mock',
      modelImage: 'mock',
      fallbackUsed: true,
    },
  });
});

app.post('/api/generate-book', async (req, res) => {
  const start = Date.now();
  const payload = (req.body ?? {}) as GenerateBookRequest;

  try {
    const prompt = buildStoryPrompt(payload);
    const storyJson = await generateStoryJsonViaDeepSeek(prompt);
    const extracted = extractStoryData(storyJson);
    if (!extracted.pages.length) throw new Error('模型返回中未找到可用页面');

    const pages = await materializePagesWithImages(extracted.pages);
    const branchA = extracted.branching ? await materializePagesWithImages(extracted.branching.paths.A) : [];
    const branchB = extracted.branching ? await materializePagesWithImages(extracted.branching.paths.B) : [];
    const branching = extracted.branching
      ? {
          branchPageIndex: extracted.branching.branchPageIndex,
          choices: extracted.branching.choices,
          paths: {
            A: branchA,
            B: branchB,
          },
        }
      : undefined;

    const storyId = `story-${Date.now()}`;
    const title =
      String(storyJson?.meta?.title || '').trim() ||
      String(storyJson?.title || '').trim() ||
      `${payload.child?.name || '小读者'}的故事`;

    const story = {
      id: storyId,
      title,
      pages,
      coverUrl: pages[0]?.imageUrl,
      createdAt: Date.now(),
      theme: payload.input?.value || '自由创作',
      outline: storyJson?.meta || null,
      generationMeta: {
        sourceType: payload.input?.type || 'topic',
        styleId: payload.style?.styleId || 'crayon',
      },
      branching,
    };

    res.json({
      story,
      meta: {
        durationMs: Date.now() - start,
        modelText: deepseekModel,
        modelImage: apimartImageModel,
        fallbackUsed: false,
      },
    });
  } catch (error) {
    const story = buildMockStory(payload);
    res.status(200).json({
      story,
      meta: {
        durationMs: Date.now() - start,
        modelText: 'fallback',
        modelImage: 'fallback',
        fallbackUsed: true,
        error: error instanceof Error ? error.message : 'unknown_error',
      },
    });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running at http://localhost:${port}`);
});

