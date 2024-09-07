const translation = {
  addteam: {
    createteam: "Create App",
    apptype: "What type of app do you want?",
    nameandicon: "Icon & Name",
    placeholderapp: "Give your app a name",
    placeholderdescription: "Enter the description of the app",
    description: "Description",
  },
  teamcard: {
    chatbot: {
      title: "Chatbot",
      description: "Basic chatbot app, single agent, can use tools",
    },
    ragbot: {
      title: "Knowledge Base Q&A",
      description:
        "RAG app, retrieves information from knowledge base during each conversation",
    },
    hagent: {
      title: "Hierarchical Multi-Agent",
      description:
        "Hierarchical type of Multi-Agent, usually used for complex task decomposition and parallel processing",
    },
    sagent: {
      title: "Sequential Multi-Agent",
      description:
        "Sequential type of Multi-Agent, usually used for task decomposition and step-by-step execution",
    },
  },
};

export default translation;
