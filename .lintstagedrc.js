module.exports = {
  "*.{js,ts}": ["eslint --ignore-path .gitignore --fix", "prettier --write ."],
  "*.json": ['prettier --write "**/*.{css,json,scss,sass}"'],
}
