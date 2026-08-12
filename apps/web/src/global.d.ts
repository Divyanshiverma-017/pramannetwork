interface Window {
  ethereum?: any;
}

declare module '*.mdx' {
  const component: React.ComponentType<any>;
  export default component;
  export const frontmatter: Record<string, any>;
}

declare module '*.jsx' {
  const content: any;
  export default content;
  export * from 'react';
}

declare module '*.js' {
  const content: any;
  export default content;
}
