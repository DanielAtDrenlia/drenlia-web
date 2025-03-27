import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    --background-color: #f8f9fa;
    --text-color: #333;
    --light-text-color: #f8f9fa;
    --font-main: 'Roboto', sans-serif;
    --font-heading: 'Montserrat', sans-serif;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-main);
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    margin-bottom: 1rem;
  }

  a {
    text-decoration: none;
    color: var(--secondary-color);
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--accent-color);
    }
  }

  button {
    cursor: pointer;
    border: none;
    background-color: var(--secondary-color);
    color: var(--light-text-color);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: var(--accent-color);
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
`;

export default GlobalStyles; 