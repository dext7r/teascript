#!/bin/bash

# 设置超时时间（秒）
timeout=30

# 检查 config/npm.txt 是否存在，清空或创建文件
>config/npm.txt

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
  echo ".env file not found!"
  exit 1
fi

# 从 .env 文件中读取搜索目标
search_targets=$(grep '^SEARCH_TARGETS=' .env | awk -F '=' '{print $2}')

# 检查搜索目标是否为空
if [ -z "$search_targets" ]; then
  echo "No search targets found in .env file."
  exit 1
fi

# 初始化包名集合
all_packages=""

# 遍历搜索目标，获取包名
IFS=',' read -ra targets <<<"$search_targets"
for target in "${targets[@]}"; do
  echo "Searching for packages for $target..."
  packages=$(timeout $timeout pnpm search "$target" | grep "$target" | awk '{print $1}')

  if [ $? -ne 0 ]; then
    echo "Failed to search for packages for $target."
  else
    echo "Found $(echo $packages | wc -w) packages for $target."
    all_packages+="$packages\n"
  fi
done

# 去重并将包名写入 config/npm.txt
echo -e "$all_packages" | sort | uniq >config/npm.txt

echo "Package search completed and results written to npm.txt"
