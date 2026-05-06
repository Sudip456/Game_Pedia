// This file tells TypeScript to treat CSS imports as modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
