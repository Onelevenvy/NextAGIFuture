import json
import logging

from app.core.rag.qdrant import QdrantStore
from app.core.tools.retriever_tool import create_retriever_tool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

user_id = 1
upload_id = 26
query = "东莞市博视自控科技有限公司"

# 创建 QdrantStore 实例
qdrant_store = QdrantStore()

# 检查集合信息
collection_info = qdrant_store.get_collection_info()
logger.info(f"Collection info: {collection_info}")

logger.info("Checking document content:")
all_points = qdrant_store.client.scroll(
    collection_name=qdrant_store.collection_name,
    limit=10,
    with_payload=True,
    with_vectors=False,
)
for point in all_points[0]:
    logger.info(f"Point ID: {point.id}")
    logger.info(f"Payload: {point.payload}")
    logger.info(f"user_id type: {type(point.payload['metadata']['user_id'])}")
    logger.info(f"upload_id type: {type(point.payload['metadata']['upload_id'])}")


# 执行搜索
search_results = qdrant_store.search(user_id, [upload_id], query)
logger.info(f"Search found {len(search_results)} documents")
for doc in search_results:
    logger.info(f"Content: {doc.page_content[:100]}...")
    logger.info(f"Metadata: {json.dumps(doc.metadata, ensure_ascii=False, indent=2)}")
    logger.info("---")

# 创建和使用检索工具
retriever = qdrant_store.retriever(user_id, upload_id)
logger.info(f"Created retriever: {retriever}")
retriever_tool = create_retriever_tool(retriever)
logger.info(f"Created retriever tool: {retriever_tool}")

# 使用检索工具
# 使用检索工具
result, docs = retriever_tool._run(query)

logger.info(f"Retriever tool result: {result[:100]}...")
logger.info(f"Retriever tool found {len(docs)} documents")
logger.info(f"Retriever search kwargs: {retriever.search_kwargs}")
logger.info(f"Retriever vectorstore: {retriever.vectorstore}")

for doc in docs:
    logger.info(f"Retrieved document content: {doc.page_content[:100]}...")
    logger.info(
        f"Retrieved document metadata: {json.dumps(doc.metadata, ensure_ascii=False, indent=2)}"
    )
    logger.info("---")

# 执行未过滤的搜索
logger.info("Performing unfiltered search:")
unfiltered_results = qdrant_store.vector_store.similarity_search(query, k=5)
for doc in unfiltered_results:
    logger.info(f"Unfiltered Content: {doc.page_content[:100]}...")
    logger.info(
        f"Unfiltered Metadata: {json.dumps(doc.metadata, ensure_ascii=False, indent=2)}"
    )
    logger.info("---")

# 执行不带过滤器的直接搜索
logger.info("Performing search without filter:")
query_vector = qdrant_store.embedding_model.embed_query(query)
unfiltered_results = qdrant_store.client.search(
    collection_name=qdrant_store.collection_name, query_vector=query_vector, limit=5
)
for result in unfiltered_results:
    logger.info(f"Unfiltered search result: {result.payload}")


# 在文件末尾添加这个新函数
def perform_native_qdrant_search(qdrant_store, user_id, upload_id, query):
    logger.info("Performing native Qdrant API search with filter:")
    query_vector = qdrant_store.embedding_model.embed_query(query)

    # filter_condition = rest.Filter(
    #     must=[
    #         rest.FieldCondition(
    #             key="user_id",
    #             match=rest.MatchValue(value=user_id)
    #         ),
    #         rest.FieldCondition(
    #             key="upload_id",
    #             match=rest.MatchValue(value=upload_id)
    #         )
    #     ]
    # )
    filter_condition = {
        "must": [
            {"key": "metadata.user_id", "match": {"value": user_id}},
            {"key": "metadata.upload_id", "match": {"value": upload_id}},
        ]
    }

    native_results = qdrant_store.client.search(
        collection_name=qdrant_store.collection_name,
        query_vector=query_vector,
        query_filter=filter_condition,
        limit=5,
    )

    logger.info(f"Native Qdrant API search found {len(native_results)} results")
    for result in native_results:
        logger.info(f"Native search result: {result.payload}")

    return native_results


# 在主代码部分调用这个新函数
if __name__ == "__main__":
    # ... (保留之前的代码)

    # 在文件末尾添加这个调用
    native_results = perform_native_qdrant_search(
        qdrant_store, user_id, upload_id, query
    )
