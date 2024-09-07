const translation = {
  addteam: {
    createteam: "创建应用",
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
};

export default translation;
