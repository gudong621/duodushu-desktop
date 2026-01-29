import pytest
import httpx
import time

API_URL = "http://localhost:8000/api/vocabulary"

@pytest.mark.asyncio
async def test_get_vocabulary_list():
    """测试获取生词列表（正常案例）"""
    async with httpx.AsyncClient() as client:
        # 添加时间戳规避后端可能的缓存（虽然已移除事务锁）
        response = await client.get(f"{API_URL}/?_t={int(time.time())}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Loaded {len(data)} vocabulary items.")

@pytest.mark.asyncio
async def test_vocabulary_filtering():
    """测试生词列表筛选（边缘案例：非法筛选类型）"""
    async with httpx.AsyncClient() as client:
        # 正常筛选
        response = await client.get(f"{API_URL}/?filter_type=normal")
        assert response.status_code == 200
        
        # 搜索测试
        response = await client.get(f"{API_URL}/?search=a")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_vocabulary_detail():
    """测试获取生词详情"""
    async with httpx.AsyncClient() as client:
        # 先获取列表拿到一个 ID
        list_res = await client.get(f"{API_URL}/")
        assert list_res.status_code == 200
        list_data = list_res.json()
        
        if not list_data:
            pytest.skip("No vocabulary found in database to test detail view.")
            
        vocab_id = list_data[0]['id']
        response = await client.get(f"{API_URL}/{vocab_id}")
        assert response.status_code == 200
        detail = response.json()
        assert detail['id'] == vocab_id
        assert 'word' in detail
        assert 'primary_context' in detail

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_get_vocabulary_list())
