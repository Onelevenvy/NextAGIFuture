import sys

sys.path.append("./")

from app.core.rag.embeddings import get_embedding_model
from app.core.rag.qdrant import QdrantStore

# 初始化 QdrantStore 和嵌入模型
qdrant_store = QdrantStore()
embedding_model = get_embedding_model("zhipuai")

# 生成查询文本的嵌入向量
query_text = "东莞市博视自控科技有限公司"
query_vector = embedding_model.embed_query(query_text)

# 执行搜索
results = qdrant_store.vector_store.similarity_search(
    query_text,
    k=5,  # 限制结果数量
    filter={"must": [{"key": "page_content", "match": {"text": query_text}}]},
)

# 打印结果
for doc in results:
    print(f"Content: {doc.page_content}")
    print(f"Metadata: {doc.metadata}")
    print("---")
