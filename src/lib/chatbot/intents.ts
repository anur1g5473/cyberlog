export interface IntentMatch {
  intent: string;
  confidence: number; // 0–1
  keywords: string[];
}

const INTENT_REGEXES: Array<{ intent: string; patterns: RegExp[] }> = [
  {
    intent: 'security',
    patterns: [
      /security|vulnerab|exploit|payload|sqli|xss|csrf|rce|渗透|黑客|密码|bcrypt|hash|加密|脱盐/i,
      /lockout|锁定|登录失败|尝试次数|封禁/i,
      /anti.?bot|hmac|验证码|人机/i,
      /2fa|totp|双因素|二步验证| Authenticator/i,
      /rls|行级|数据隔离|多租户/i,
      /audit|审计|日志|不可变/i,
      /service.?role|服务角色|隔离/i,
      /enumeration|枚举|用户名|探测/i,
      /cache|缓存|失效/i,
      /session|会话|超时|空闲/i,
    ],
  },
  {
    intent: 'blog',
    patterns: [
      /blog|文章|帖子|日志|post|写一篇|写一篇文章/i,
      /markdown|格式|编辑|内容/i,
      /slug|url|链接|地址/i,
      /read.?me|文档|说明/i,
    ],
  },
  {
    intent: 'projects',
    patterns: [
      /project|项目|技术栈|tech.?stack|展示|作品/i,
      /github|demo|仓库|仓库地址/i,
      /featured|feature|置顶|推荐/i,
    ],
  },
  {
    intent: 'contact',
    patterns: [
      /contact|联系|邮件|email|联系方式|怎么找到/i,
      /address|地址|位置|location/i,
      /telegram|discord|github|linkedin/i,
    ],
  },
  {
    intent: 'status',
    patterns: [
      /status|状态|运行|health|uptime|在线|挂了吗/i,
      /error|报错|故障|down|宕机/i,
    ],
  },
  {
    intent: 'help',
    patterns: [
      /help|帮助|命令|菜单|有哪些|能做什么/i,
      /menu|快捷键|操作/i,
    ],
  },
];

/**
 * Classifies user input into a ranked list of matching intents using keyword regexes.
 * Returns top matches sorted by confidence (number of matching patterns).
 */
export function classifyIntents(userInput: string, topN = 3): IntentMatch[] {
  const lower = userInput.toLowerCase();
  const matches: IntentMatch[] = [];

  for (const { intent, patterns } of INTENT_REGEXES) {
    const matchedKeywords: string[] = [];
    let hits = 0;
    for (const pattern of patterns) {
      if (pattern.test(userInput)) {
        hits++;
        matchedKeywords.push(pattern.source.slice(0, 40));
      }
    }
    if (hits > 0) {
      matches.push({
        intent,
        confidence: Math.min(hits / patterns.length + 0.3, 1),
        keywords: matchedKeywords,
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, topN);
}

export function topIntent(userInput: string): string {
  const matches = classifyIntents(userInput);
  return matches[0]?.intent ?? 'general';
}