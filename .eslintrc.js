module.exports = {
  root: true,
  // 全局配置
  globals: {
  },
  env: {
    node: true
  },
  'extends': [
    "standard", "standard-react", "react-app"
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    "ecmaFeatures": {
      "jsx": true
    },
    parser: 'babel-eslint'
  }
}
