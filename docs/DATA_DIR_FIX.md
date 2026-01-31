# 数据目录配置问题修复说明

**修复日期**: 2026-02-01

## 问题描述

打包的客户端的 data 目录设置有问题，从客户端上传的书籍和导入的词典会存到开发环境（`backend/data`），而不是应该存到正确的位置（便携模式或标准模式的数据目录）。

## 根本原因分析

### 问题1：开发模式下使用了错误的路径计算方式

**文件**: `electron/main.ts` 第 174-175 行

**原代码**:
```typescript
if (IS_DEV) {
   dataPath = path.join(process.cwd(), 'backend', 'data');
}
```

**问题**:
- 使用 `process.cwd()` 返回的是当前工作目录，而不是应用目录
- 在某些情况下，当前工作目录可能不是项目根目录
- 这导致 `dataPath` 计算不正确

**影响**:
- 在开发环境中，如果从非项目根目录运行应用，数据目录会指向错误的位置
- 在打包后的应用中，如果 `IS_DEV` 判定不准确，会使用错误的数据目录

### 问题2：后端数据目录创建不够健壮

**文件**: `backend/run_backend.py` 第 19-21 行

**原代码**:
```python
if args.data_dir:
    data_path = Path(args.data_dir).resolve()
    os.environ["APP_DATA_DIR"] = str(data_path)
```

**问题**:
- 没有验证数据目录是否可以创建或访问
- 如果数据目录创建失败，没有错误提示
- 没有记录是否使用了 `--data-dir` 参数

**影响**:
- 如果数据目录无法创建，应用会默认使用 `backend/data`，但用户不知道
- 难以调试数据目录相关的问题

### 问题3：配置日志不够详细

**文件**: `backend/app/config.py` 第 15-19 行

**原代码**:
```python
env_data_dir = os.getenv("APP_DATA_DIR")
if env_data_dir:
    DATA_DIR = Path(env_data_dir).resolve()
else:
    DATA_DIR = BASE_DIR / "data"
```

**问题**:
- 没有记录是否使用了环境变量
- 没有记录最终使用的数据目录
- 难以调试数据目录相关的问题

## 修复方案

### 修复1：使用 `app.getAppPath()` 而不是 `process.cwd()`

**文件**: `electron/main.ts` 第 174-179 行

**修改后的代码**:
```typescript
if (IS_DEV) {
   // 开发环境：使用 app.getAppPath() 而不是 process.cwd()
   // app.getAppPath() 返回应用目录（项目根目录），更可靠
   const appPath = app.getAppPath();
   dataPath = path.join(appPath, 'backend', 'data');
   logToFile(`开发模式 - 使用应用目录: ${appPath}`);
}
```

**优点**:
- `app.getAppPath()` 总是返回应用目录，不受当前工作目录影响
- 更可靠，不会因为工作目录改变而出现问题
- 添加了日志，便于调试

### 修复2：增强后端数据目录处理

**文件**: `backend/run_backend.py` 第 19-32 行

**修改后的代码**:
```python
if args.data_dir:
    # 确保转换为绝对路径，并验证路径有效性
    data_path = Path(args.data_dir).resolve()

    # 验证路径是否可访问
    try:
        data_path.mkdir(parents=True, exist_ok=True)
        os.environ["APP_DATA_DIR"] = str(data_path)
        print(f"[Backend] Data directory set to: {data_path}")
    except Exception as e:
        print(f"[Backend] Warning: Failed to create/access data directory {data_path}: {e}")
        print(f"[Backend] Will use default data directory")
else:
    print(f"[Backend] No --data-dir specified, using default data directory")
```

**优点**:
- 验证数据目录是否可以创建
- 提供清晰的错误提示
- 记录是否使用了 `--data-dir` 参数
- 便于调试

### 修复3：增强配置日志

**文件**: `backend/app/config.py` 第 15-20 行

**修改后的代码**:
```python
env_data_dir = os.getenv("APP_DATA_DIR")
if env_data_dir:
    DATA_DIR = Path(env_data_dir).resolve()
    logger.info(f"使用环境变量 APP_DATA_DIR: {DATA_DIR}")
else:
    DATA_DIR = BASE_DIR / "data"
    logger.warning(f"未设置 APP_DATA_DIR 环境变量，使用默认开发环境路径: {DATA_DIR}")
```

**优点**:
- 记录是否使用了环境变量
- 记录最终使用的数据目录
- 使用 `warning` 级别提示未设置环境变量
- 便于调试

## 验证修复

### 开发环境验证

1. 从项目根目录运行 `npm run dev`
2. 查看 Electron 启动日志（`userData/startup.log`）
3. 确认日志中显示 `开发模式 - 使用应用目录: ...`
4. 查看后端日志，确认 `Data directory set to: ...`
5. 上传书籍或导入词典，确认文件存储在 `backend/data` 目录

### 打包后验证

1. 构建打包应用：`npm run package`
2. 运行打包后的应用
3. 查看 Electron 启动日志（`userData/startup.log`）
4. 确认日志中显示正确的数据目录（便携模式或标准模式）
5. 上传书籍或导入词典，确认文件存储在正确的位置

### 便携模式验证

1. 在 exe 同级创建 `data` 目录
2. 运行 exe
3. 查看 Electron 启动日志
4. 确认日志中显示 `检测到同级 data 目录，启用便携模式: ...`
5. 上传书籍或导入词典，确认文件存储在 `data` 目录

## 相关文件

- `electron/main.ts`: Electron 主进程，负责启动后端和创建窗口
- `backend/run_backend.py`: 后端启动脚本，负责处理命令行参数
- `backend/app/config.py`: 后端配置文件，负责读取环境变量和设置数据目录
- `docs/DATA_STORAGE.md`: 数据存储详解文档

## 后续建议

1. **添加健康检查**: 在应用启动时检查数据目录是否可访问
2. **添加配置界面**: 允许用户在应用中修改数据目录
3. **添加数据迁移工具**: 帮助用户从旧数据目录迁移到新数据目录
4. **添加更详细的日志**: 记录所有文件操作，便于调试
