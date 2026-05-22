module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
