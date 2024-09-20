const translation = {
  addteam: {
    createteam: "创建应用",
    editteam: "编辑应用",
    apptype: "想要哪种应用类型？",
    nameandicon: "图标 & 名称",
    placeholderapp: "给你的应用取个名字",
    placeholderdescription: "输入应用的描述",
    description: "描述",
  },
  teamcard: {
    chatbot: {
      title: "聊天机器人",
      description: "基本的聊天机器人应用，单Agent，可以使用工具",
    },
    ragbot: {
      title: "知识库问答",
      description: "RAG应用，每次对话时可以从知识库中检索信息",
    },
    workflow: {
      title: "工作流应用",
      description: "以工作流的形式编排生成型应用，提供更多的自定义能力",
    },
    hagent: {
      title: "Hierarchical Muti-Agent",
      description:
        "Hierarchical类型的Muti-Agent，通常用于复杂任务分解和并行处理的场景",
    },
    sagent: {
      title: "Sequential Muti-Agent",
      description:
        "Sequential类型的Muti-Agent，通常用于任务分解和逐步执行的场景",
    },
  },
  teamsetting: {
    debugoverview: "调试预览",
    savedeploy: "发布",
    name: "名字",
    description: "描述",
    type: "类型",
    role: "角色",
    backstory: "背景故事",
    model: "模型",
    tools: "工具",
    knowledge: "知识库",
    chathistory: "聊天记录",
  },
};

export default translation;
