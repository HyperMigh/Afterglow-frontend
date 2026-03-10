export const messages = {
  zh: {
    app: {
      brandSubtitle: "产品平台",
      links: {
        product: "产品",
        solutions: "方案",
        pricing: "定价",
        docs: "文档"
      },
      auth: {
        login: "登录",
        getStarted: "立即开始",
        workspace: "工作台",
        logout: "退出登录"
      },
      localeSwitchToChinese: "切换到中文",
      localeSwitchToEnglish: "Switch to English"
    },
    home: {
      heroKicker: "Afterglow",
      heroTitle: "用清晰协作构建更好的产品",
      heroSubtitle: "Afterglow 帮助团队把反馈、讨论和决策组织成可靠的执行路径。",
      primaryCtaWorkspace: "进入工作台",
      primaryCtaGetStarted: "立即开始",
      docsCta: "查看文档",
      productTitle: "产品能力",
      productSubtitle: "面向现代 SaaS 团队的关键能力，兼顾速度与精度。",
      solutionsTitle: "解决方案",
      solutionsSubtitle: "为跨职能产品团队设计。",
      pricingTitle: "定价方案",
      pricingSubtitle: "覆盖不同发展阶段团队的简洁计划。",
      docsTitle: "文档",
      docsSubtitle: "用于实现和运维的实用文档。",
      ctaTitle: "准备好更稳更快地推进了吗？",
      ctaSubtitle: "从 Afterglow 开始，为你的产品执行引入更多结构和清晰度。",
      footerTagline: "为现代产品团队打造的清晰软件。",
      productFeatures: [
        {
          title: "统一上下文",
          description: "把产品信号、用户反馈和团队进展集中到一个清晰工作区。"
        },
        {
          title: "可靠流程",
          description: "通过结构化协作和可预期执行，沉淀可复用的交付流程。"
        },
        {
          title: "可行动洞察",
          description: "将原始讨论转化为可衡量的优先级和产品决策。"
        }
      ],
      solutions: [
        {
          title: "产品团队",
          text: "在需求探索、开发交付和路线规划中保持上下文一致。"
        },
        {
          title: "客户运营",
          text: "通过更清晰的交接，保持支持链路连续性。"
        },
        {
          title: "社区平台",
          text: "基于结构化互动历史，实现更清晰的社区治理与运营。"
        }
      ],
      plans: [
        {
          name: "Starter",
          price: "$0",
          note: "适合初期探索",
          items: ["基础工作区", "基础协作能力", "社区支持"]
        },
        {
          name: "Growth",
          price: "$29",
          note: "每用户 / 每月",
          items: ["高级流程编排", "优先支持", "团队分析"]
        },
        {
          name: "Enterprise",
          price: "定制",
          note: "适合大型组织",
          items: ["安全控制", "SLA 支持", "定制集成"]
        }
      ],
      docItems: [
        "前后端快速启动指南。",
        "认证与 API 集成说明。",
        "部署与运行配置说明。"
      ]
    },
    roadmap: {
      eyebrow: "路线图快照",
      heroTitle: "开发路线正在从“可运行”走向“可持续迭代”。",
      heroSubtitle: "路线图围绕五个阶段推进：先保证业务闭环，再扩展实时能力、情绪能力与 AI 能力。",
      panelTitle: "里程碑拆分",
      milestones: [
        {
          id: "M1",
          name: "认证与基础骨架",
          status: "已完成",
          goals: ["邮箱验证码登录", "统一响应与异常处理", "基础用户信息接口"]
        },
        {
          id: "M2",
          name: "社区时间线",
          status: "进行中",
          goals: ["发帖/评论/点赞", "举报链路", "游标分页与交互打磨"]
        },
        {
          id: "M3",
          name: "私聊能力",
          status: "待启动",
          goals: ["会话列表", "WebSocket 通道", "已读游标与基础同步"]
        },
        {
          id: "M4",
          name: "情绪模块",
          status: "待启动",
          goals: ["文本情绪识别", "颜色映射策略", "情绪概览卡片"]
        },
        {
          id: "M5",
          name: "AI 安抚助手",
          status: "待启动",
          goals: ["静一下建议生成", "敏感场景安全边界", "降级与可观测性"]
        }
      ]
    },
    authPortal: {
      brandSubtitle: "产品平台",
      backHome: "返回主页面",
      modeAriaLabel: "认证模式",
      loginTab: "登录",
      signupTab: "注册",
      sceneTitleLogin: "欢迎回来",
      sceneTitleSignup: "创建账号",
      sceneDescLogin: "使用邮箱验证码完成身份验证并进入工作台。",
      sceneDescSignup: "通过邮箱验证码创建账号，流程安全且稳定。",
      canvasKicker: "AFTERGLOW",
      canvasEmotionLogin: "夜色会过去，你的心事会在这里被温柔接住。",
      canvasEmotionSignup: "从这一刻起，我们一起把情绪与表达慢慢安放。",
      canvasSlogansLogin: [
        "久别重逢，不必解释太多。",
        "把今天的疲惫放下，让清晰慢慢回来。",
        "那些没说完的话，在这里继续。"
      ],
      canvasSlogansSignup: [
        "第一次开口，也值得被认真回应。",
        "为每一次情绪起伏，留一盏稳定的晚光。",
        "从此有一个地方，记录你真实的声音。"
      ],
      emailLabel: "邮箱",
      emailPlaceholder: "you@company.com",
      codeLabel: "验证码",
      codePlaceholder: "6 位数字验证码",
      captchaLabel: "图形验证码",
      captchaPlaceholder: "输入图形验证码",
      captchaAlt: "图形验证码",
      captchaFallback: "刷新",
      sendingCode: "发送中",
      sendCode: "发送验证码",
      retryCode: "重试 {{seconds}}s",
      loggingIn: "登录中",
      creatingAccount: "注册中",
      submitLogin: "登录",
      submitSignup: "注册",
      defaultFeedbackLogin: "请输入邮箱验证码和图形验证码后继续。",
      defaultFeedbackSignup: "请完成邮箱验证码和图形验证码以完成注册。",
      codeSentWithRemaining: "验证码已发送，剩余 {{seconds}}s。",
      codeSentFallback: "验证码已发送，请尽快完成验证。",
      codeExpired: "验证码已过期，请重新获取。",
      loadCaptchaFailed: "加载图形验证码失败",
      modeLogin: "当前为登录模式",
      modeSignup: "当前为注册模式",
      invalidEmail: "请输入有效邮箱地址",
      sendCodeFailed: "发送验证码失败",
      invalidCode: "邮箱验证码必须为 6 位数字",
      invalidCaptcha: "请输入图形验证码",
      loginSuccess: "登录成功，正在跳转...",
      signupSuccess: "账号创建成功，正在跳转...",
      loginFailed: "登录失败",
      signupFailed: "注册失败",
      oauthUnavailable: "{{provider}} 登录即将支持。",
      dividerText: "或使用以下方式继续"
    },
    feed: {
      heroTitle: "社区时间线",
      heroSubtitle: "已接入发帖、评论、点赞、举报和游标分页。当前阶段重点是提升交互连贯性与信息可读性。",
      statPosts: "帖子",
      statLikes: "点赞",
      statComments: "评论",
      statHasMore: "支持继续加载",
      statNoMore: "已到末尾",
      composerTitle: "发布帖子",
      composerSubtitle: "表达你的想法、近况或问题，支持附带图片链接。",
      contentLabel: "内容（最多 2000 字）",
      contentPlaceholder: "分享你此刻的想法...",
      mediaLabel: "图片 URL（可选，每行一个）",
      mediaPlaceholder: "https://example.com/a.png",
      anonymousPublish: "匿名发布",
      publishing: "发布中...",
      publishPost: "发布帖子",
      refreshTimeline: "刷新时间线",
      postListTitle: "帖子列表",
      reload: "重新加载",
      loadingTimeline: "正在加载时间线...",
      emptyPosts: "还没有帖子，发布第一条内容吧。",
      anonymousUser: "匿名用户",
      tagAnonymous: "匿名",
      tagMine: "我的",
      delete: "删除",
      like: "点赞",
      comments: "评论",
      collapseComments: "收起评论",
      report: "举报",
      collapseReport: "收起举报",
      reportReasonLabel: "举报原因",
      reportReasons: [
        { value: "spam", label: "垃圾信息" },
        { value: "abuse", label: "辱骂攻击" },
        { value: "violent", label: "暴力内容" },
        { value: "other", label: "其他" }
      ],
      reportDetailLabel: "补充说明（可选）",
      reportDetailPlaceholder: "补充更多上下文，帮助快速处理",
      reportSubmitting: "提交中...",
      submitReport: "提交举报",
      commentPlaceholder: "写下你的评论...",
      sending: "发送中...",
      send: "发送",
      loadingComments: "正在加载评论...",
      noComments: "暂无评论",
      loadMoreComments: "加载更多评论",
      loadingMore: "加载中...",
      loadMore: "加载更多",
      dateLocale: "zh-CN"
    },
    chat: {
      heroTitle: "私聊会话",
      heroSubtitle: "支持会话创建、消息历史、HTTP 兜底发送，以及 WebSocket 实时事件同步。",
      wsConnected: "WebSocket 已连接",
      wsDisconnected: "WebSocket 未连接（将使用 HTTP 兜底）",
      startConversation: "发起会话",
      refreshCandidates: "刷新候选用户",
      refreshing: "刷新中...",
      startByUserId: "按用户 ID 发起会话",
      targetUserPlaceholder: "输入目标用户 ID",
      start: "发起",
      conversationList: "会话列表",
      loading: "加载中...",
      refreshConversation: "刷新会话",
      emptyConversation: "当前没有会话，先从左侧发起一个。",
      noMessage: "暂无消息",
      loadMoreConversations: "加载更多会话",
      conversationWith: "与 {{name}} 的对话",
      loadOlder: "加载更早消息",
      inputPlaceholder: "输入消息，Enter 发送",
      send: "发送",
      chooseConversation: "请选择一个会话开始聊天。",
      idPrefix: "ID",
      dateLocale: "zh-CN"
    },
    mirror: {
      heroTitle: "静一下",
      heroSubtitle: "基于最近 24 小时内容，输出 summary / suggestion / question，并给出安全标记。",
      running: "生成中...",
      runLatest: "生成最新镜像",
      refreshing: "刷新中...",
      refreshHistory: "刷新历史",
      latestTitle: "最新镜像结果",
      noLatest: "暂无镜像记录，先点击上方按钮生成。",
      riskFlags: "风险标记",
      summary: "Summary",
      suggestion: "Suggestion",
      question: "Question",
      generatedAt: "生成时间",
      historyTitle: "镜像历史",
      flagsPrefix: "标记",
      loadMoreHistory: "加载更多历史",
      loadingMore: "加载中...",
      dateLocale: "zh-CN"
    }
  },
  en: {
    app: {
      brandSubtitle: "Product Platform",
      links: {
        product: "Product",
        solutions: "Solutions",
        pricing: "Pricing",
        docs: "Docs"
      },
      auth: {
        login: "Login",
        getStarted: "Get Started",
        workspace: "Workspace",
        logout: "Logout"
      },
      localeSwitchToChinese: "Switch to Chinese",
      localeSwitchToEnglish: "Switch to English"
    },
    home: {
      heroKicker: "Afterglow",
      heroTitle: "Build Better Products With Clarity.",
      heroSubtitle: "Afterglow helps teams organize feedback, conversations, and decisions into clean and trustworthy execution.",
      primaryCtaWorkspace: "Open Workspace",
      primaryCtaGetStarted: "Get Started",
      docsCta: "View Docs",
      productTitle: "Product",
      productSubtitle: "Essential capabilities for modern SaaS teams that value speed and precision.",
      solutionsTitle: "Solutions",
      solutionsSubtitle: "Designed for cross-functional product organizations.",
      pricingTitle: "Pricing",
      pricingSubtitle: "Simple plans for teams at every stage.",
      docsTitle: "Docs",
      docsSubtitle: "Practical documentation for implementation and operations.",
      ctaTitle: "Ready to Move Faster With Confidence?",
      ctaSubtitle: "Start with Afterglow and bring more structure and clarity into your product execution.",
      footerTagline: "Clean software for modern product teams.",
      productFeatures: [
        {
          title: "Unified Context",
          description: "Connect product signals, user feedback, and team updates in one clear workspace."
        },
        {
          title: "Reliable Workflows",
          description: "Ship repeatable processes with structured collaboration and predictable execution."
        },
        {
          title: "Actionable Insights",
          description: "Transform raw conversations into measurable priorities and product decisions."
        }
      ],
      solutions: [
        {
          title: "Product Teams",
          text: "Align discovery, delivery, and roadmap discussions without context loss."
        },
        {
          title: "Customer Operations",
          text: "Maintain continuity across support interactions with cleaner handoffs."
        },
        {
          title: "Community Platforms",
          text: "Moderate and engage with clarity using structured interaction history."
        }
      ],
      plans: [
        {
          name: "Starter",
          price: "$0",
          note: "For early exploration",
          items: ["Core workspace", "Basic collaboration", "Community support"]
        },
        {
          name: "Growth",
          price: "$29",
          note: "Per user / month",
          items: ["Advanced workflows", "Priority support", "Team analytics"]
        },
        {
          name: "Enterprise",
          price: "Custom",
          note: "For larger organizations",
          items: ["Security controls", "SLA support", "Custom integrations"]
        }
      ],
      docItems: [
        "Quickstart setup for frontend and backend.",
        "Authentication and API integration guides.",
        "Deployment and runtime configuration notes."
      ]
    },
    roadmap: {
      eyebrow: "Roadmap Snapshot",
      heroTitle: "The roadmap is moving from runnable to sustainably iterative.",
      heroSubtitle: "The plan advances through five stages: close core business loops first, then expand real-time, emotion, and AI capabilities.",
      panelTitle: "Milestone Breakdown",
      milestones: [
        {
          id: "M1",
          name: "Auth & Base Skeleton",
          status: "Done",
          goals: ["Email code login", "Unified responses and error handling", "Basic profile APIs"]
        },
        {
          id: "M2",
          name: "Community Feed",
          status: "In Progress",
          goals: ["Post/comment/like", "Reporting flow", "Cursor pagination and UX polish"]
        },
        {
          id: "M3",
          name: "Direct Messages",
          status: "Planned",
          goals: ["Conversation list", "WebSocket channel", "Read cursor and baseline sync"]
        },
        {
          id: "M4",
          name: "Emotion Module",
          status: "Planned",
          goals: ["Text emotion detection", "Color mapping strategy", "Emotion overview cards"]
        },
        {
          id: "M5",
          name: "AI Comfort Assistant",
          status: "Planned",
          goals: ["Mirror suggestion generation", "Safety boundaries for sensitive scenarios", "Fallback and observability"]
        }
      ]
    },
    authPortal: {
      brandSubtitle: "Product Platform",
      backHome: "Back to Home",
      modeAriaLabel: "Authentication mode",
      loginTab: "Login",
      signupTab: "Sign up",
      sceneTitleLogin: "Welcome back",
      sceneTitleSignup: "Create your account",
      sceneDescLogin: "Use your email verification credentials to access your workspace.",
      sceneDescSignup: "Create an account with email verification in a secure and reliable flow.",
      canvasKicker: "AFTERGLOW",
      canvasEmotionLogin: "Tonight can soften. Your thoughts are safe here.",
      canvasEmotionSignup: "Start gently. Build a space that listens with care.",
      canvasSlogansLogin: [
        "You do not have to explain everything to be welcomed back.",
        "Set the weight of today down and let clarity return.",
        "Pick up the unfinished conversation right here."
      ],
      canvasSlogansSignup: [
        "Your first words deserve a thoughtful response.",
        "Keep a steady glow for every emotional high and low.",
        "Create a place where your real voice can stay."
      ],
      emailLabel: "Email",
      emailPlaceholder: "you@company.com",
      codeLabel: "Verification code",
      codePlaceholder: "6-digit code",
      captchaLabel: "Captcha",
      captchaPlaceholder: "Enter captcha",
      captchaAlt: "Captcha",
      captchaFallback: "Refresh",
      sendingCode: "Sending",
      sendCode: "Send code",
      retryCode: "Retry {{seconds}}s",
      loggingIn: "Logging in",
      creatingAccount: "Creating account",
      submitLogin: "Login",
      submitSignup: "Sign up",
      defaultFeedbackLogin: "Enter your 6-digit code and captcha to continue.",
      defaultFeedbackSignup: "Complete verification details to finish registration.",
      codeSentWithRemaining: "Verification code sent. {{seconds}}s remaining.",
      codeSentFallback: "Verification code sent. Please complete validation soon.",
      codeExpired: "Code expired. Please request a new one.",
      loadCaptchaFailed: "Failed to load captcha",
      modeLogin: "Login mode",
      modeSignup: "Signup mode",
      invalidEmail: "Please enter a valid email address",
      sendCodeFailed: "Failed to send code",
      invalidCode: "Verification code must be 6 digits",
      invalidCaptcha: "Please enter the captcha code",
      loginSuccess: "Login successful. Redirecting...",
      signupSuccess: "Account created. Redirecting...",
      loginFailed: "Login failed",
      signupFailed: "Signup failed",
      oauthUnavailable: "{{provider}} login will be available soon.",
      dividerText: "or continue with"
    },
    feed: {
      heroTitle: "Community Feed",
      heroSubtitle: "Posting, comments, likes, reports, and cursor pagination are integrated. The current focus is interaction continuity and readability.",
      statPosts: "Posts",
      statLikes: "Likes",
      statComments: "Comments",
      statHasMore: "Can load more",
      statNoMore: "End reached",
      composerTitle: "Create Post",
      composerSubtitle: "Share ideas, updates, or questions. Image links are supported.",
      contentLabel: "Content (max 2000 chars)",
      contentPlaceholder: "Share what is on your mind...",
      mediaLabel: "Image URLs (optional, one per line)",
      mediaPlaceholder: "https://example.com/a.png",
      anonymousPublish: "Post anonymously",
      publishing: "Publishing...",
      publishPost: "Publish post",
      refreshTimeline: "Refresh feed",
      postListTitle: "Post List",
      reload: "Reload",
      loadingTimeline: "Loading feed...",
      emptyPosts: "No posts yet. Publish the first one.",
      anonymousUser: "Anonymous",
      tagAnonymous: "Anonymous",
      tagMine: "Mine",
      delete: "Delete",
      like: "Like",
      comments: "Comments",
      collapseComments: "Hide comments",
      report: "Report",
      collapseReport: "Hide report",
      reportReasonLabel: "Reason",
      reportReasons: [
        { value: "spam", label: "Spam" },
        { value: "abuse", label: "Abuse" },
        { value: "violent", label: "Violence" },
        { value: "other", label: "Other" }
      ],
      reportDetailLabel: "Details (optional)",
      reportDetailPlaceholder: "Add context to help us process it faster",
      reportSubmitting: "Submitting...",
      submitReport: "Submit report",
      commentPlaceholder: "Write a comment...",
      sending: "Sending...",
      send: "Send",
      loadingComments: "Loading comments...",
      noComments: "No comments yet",
      loadMoreComments: "Load more comments",
      loadingMore: "Loading...",
      loadMore: "Load more",
      dateLocale: "en-US"
    },
    chat: {
      heroTitle: "Direct Messages",
      heroSubtitle: "Supports conversation creation, message history, HTTP fallback sending, and real-time WebSocket sync.",
      wsConnected: "WebSocket connected",
      wsDisconnected: "WebSocket disconnected (HTTP fallback active)",
      startConversation: "Start Conversation",
      refreshCandidates: "Refresh candidates",
      refreshing: "Refreshing...",
      startByUserId: "Start by user ID",
      targetUserPlaceholder: "Enter target user ID",
      start: "Start",
      conversationList: "Conversations",
      loading: "Loading...",
      refreshConversation: "Refresh list",
      emptyConversation: "No conversations yet. Start one from the left panel.",
      noMessage: "No message",
      loadMoreConversations: "Load more conversations",
      conversationWith: "Conversation with {{name}}",
      loadOlder: "Load older messages",
      inputPlaceholder: "Type a message, press Enter to send",
      send: "Send",
      chooseConversation: "Select a conversation to start chatting.",
      idPrefix: "ID",
      dateLocale: "en-US"
    },
    mirror: {
      heroTitle: "Mirror",
      heroSubtitle: "Based on the latest 24h content, returns summary / suggestion / question with safety flags.",
      running: "Running...",
      runLatest: "Generate latest mirror",
      refreshing: "Refreshing...",
      refreshHistory: "Refresh history",
      latestTitle: "Latest Result",
      noLatest: "No mirror records yet. Generate one first.",
      riskFlags: "Risk Flags",
      summary: "Summary",
      suggestion: "Suggestion",
      question: "Question",
      generatedAt: "Generated at",
      historyTitle: "History",
      flagsPrefix: "Flags",
      loadMoreHistory: "Load more history",
      loadingMore: "Loading...",
      dateLocale: "en-US"
    }
  }
};
