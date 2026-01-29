from sqlalchemy.orm import Session
from ..models.models import CacheDictionary, CacheAudio
import json
import hashlib

def get_dictionary_cache(db: Session, word: str):
    """从缓存获取单词释义"""
    cache = db.query(CacheDictionary).filter(CacheDictionary.word == word).first()
    if cache:
        return cache.data
    return None

def save_dictionary_cache(db: Session, word: str, data: dict):
    """保存单词释义到缓存"""
    cache = CacheDictionary(word=word, data=data)
    db.merge(cache) # merge update if exists
    db.commit()

def get_audio_cache(db: Session, text: str):
    """从缓存获取音频"""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    cache = db.query(CacheAudio).filter(CacheAudio.text_hash == text_hash).first()
    if cache:
        return cache.audio_data
    return None

def save_audio_cache(db: Session, text: str, audio_data: bytes):
    """保存音频到缓存"""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    cache = CacheAudio(text_hash=text_hash, audio_data=audio_data)
    db.merge(cache)
    db.commit()
