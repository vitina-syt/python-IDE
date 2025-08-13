import requests
import json
import os
from bs4 import BeautifulSoup

headers={
    'referer': 'https://news.qq.com',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
}

def getPage(url):
    try:
        response = requests.get(url, headers=headers)
        # response.encoding = response.apparent_encoding
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容长度: {len(response.text)}")
        with open('soup.html', 'a+', encoding='utf-8') as f:
            f.write(response.text)
         # 检查响应内容是否为空
        # if not response.text:
        #     print("错误：响应内容为空")
        #     return None
            
        # # 检查是否为JSON格式
        # if not response.text.strip().startswith('{') and not response.text.strip().startswith('['):
        #     print("错误：响应不是有效的JSON格式")
        #     print(f"响应前200字符: {response.text[:200]}")
        #     return None
        news_items = soup.select('div[class*="channelConfig"] a')
        # data = response.json()
        print(f"新闻: {news_items}")
        if news_items:
            return news_items
        else:
            print(f"请求失败，状态码: {response.status_code}")
            return None
    except Exception as e:
        print(f"请求异常: {e}")
        return None

# 获取新闻
def parse_news(text, f):
    # 添加空值检查
    if text is None:
        print("错误：接收到空数据")
        return
        
    try:
        if 'data' in text and 'list' in text['data']:
            content = text['data']['list']  # 热点精选
        elif 'data' in text:
            content = text['data']  # 综合早报和热问
        else:
            print("错误：数据格式不正确")
            return
    except Exception as e:
        print(f"解析数据时出错: {e}")
        return
        
    for item in content:
        if 'url' in item and 'title' in item:
            source = item['url']
            title = item['title']
            f.write("{} {}\n".format(title, source))
        else:
            print("警告：跳过不完整的新闻项")

if __name__ == '__main__':
    today_news_url='https://news.qq.com/tag/aEWqxLtdgmQ='
    today_topic_url='https://news.qq.com/ch/qa'
    
    # 获取综合早报
    print("开始获取综合早报>>>")
    today_news = getPage(today_news_url)
    if today_news is not None:
        with open('09_腾讯新闻.txt', 'a+', encoding='utf-8') as f:
            f.write("综合早报\n")
            parse_news(today_news, f)
        print("...综合早报获取完毕")
    else:
        print("...综合早报获取失败")
    
    # 获取热问
    print("开始获取热问>>>")
    today_topic = getPage(today_topic_url)
    if today_topic is not None:
        with open('09_腾讯新闻.txt', 'a+', encoding='utf-8') as f:
            f.write("热问\n")
            parse_news(today_topic, f)
        print("...热问获取完毕")
    else:
        print("...热问获取失败")
    
    print("保存完毕！路径为 {}{}".format(os.getcwd(), os.sep + '09_腾讯新闻.txt'))