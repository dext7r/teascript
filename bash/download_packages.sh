#!/bin/bash

# 创建临时目录
mkdir -p temp

# 记录错误信息的文件
error_log="error.log"

# 清空之前的错误日志文件
> "$error_log"

# 读取npm.txt文件，每行处理一个包
packages=($(< config/npm.txt))
total_packages=${#packages[@]}  # 总包数

# 成功下载的包数量
success_count=0

# 读取npm.txt文件，每行处理一个包
index=0
while IFS= read -r package_name; do
    ((index++))

    # 清理空格和其他不可见字符
    package_name=$(echo "$package_name" | tr -d '[:space:]')

    if [ -n "$package_name" ]; then
        # 获取包的下载地址
        download_url=$(npm info "$package_name" dist.tarball 2>/dev/null)
        
        if [ $? -eq 0 ] && [ -n "$download_url" ]; then
            # 提取包名，保留组织名
            if [[ $package_name == @*/* ]]; then
                # 如果包名是组织包名（@organization/package-name）
                package_basename=$(basename "$download_url")
                org_name=$(dirname "$download_url" | awk -F'/' '{print $NF}')
                package_name="$org_name/$package_basename"
            else
                # 普通包名
                package_basename=$(basename "$download_url")
            fi
            
            # 去掉.tgz后缀
            package_name="${package_basename%.tgz}"
            
            # 确保目标解压目录存在
            target_dir="temp/$package_name"
            mkdir -p "$target_dir"

            # 下载并解压缩到temp/包名目录
            echo -n "正在下载并解压 $package_name... "

            # 下载文件并解压缩
            if curl -sL "$download_url" | tar -xz -C "$target_dir" --strip-components=1; then
                ((success_count++))
                
                # 处理可能带有@符号的文件夹名
                if [[ "$package_name" == *@* ]]; then
                    new_package_name=$(echo "$package_name" | sed 's/@/at/')
                    mv "$target_dir" "$new_package_name"
                    package_name="$new_package_name"
                fi
                
                echo "完成."
            else
                echo "解压失败." | tee -a "$error_log"
            fi
        else
            echo "获取下载地址失败." | tee -a "$error_log"
        fi
    else
        echo "发现空或无效的包名."
    fi

    # 计算当前进度百分比
    progress=$((index * 100 / total_packages))
    echo "当前进度：$index/$total_packages ($progress%) 成功数量：$success_count"
done < config/npm.txt

echo "包处理完成。请查看 $error_log 获取详细错误信息."
