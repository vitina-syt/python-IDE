# 使用langchain和openai创建问答系统
import os
from dotenv import load_dotenv  # 添加这行

# 加载.env文件
load_dotenv()  # 添加这行
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI
from langchain_community.document_loaders import DirectoryLoader

#加载文件
loader=DirectoryLoader("./", glob="**/*.pdf")
#数据转document
documents=loader.load()

#初始化加载器
text_splitter=CharacterTextSplitter(chunk_size=100,chunk_overlap=0)
#切割document
split_docs=text_splitter.split_documents(documents)
#初始化openai embeddings对象
embeddings=OpenAIEmbeddings()
#存入chroma向量数据库
docsearch=Chroma.from_documents(split_docs,embeddings)
#创建问答
qa=RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
    return_source_documents=True)
#实现问答
result = qa({"query": "大模型是什么？"})
print(result)
