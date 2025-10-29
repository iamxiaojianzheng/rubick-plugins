#!/bin/bash
exclude_list=".gitignore out build.sh .git .idea .DS_Store .npm dist node_modules"

rm -rf ./dist
mkdir -p ./dist

for file in *; do
  if [[ ! " $exclude_list " =~ " $file " ]]; then
    cp -r "$file" ./dist
  fi
done

echo "build success"
