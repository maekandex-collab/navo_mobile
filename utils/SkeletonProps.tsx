export const useSkeletonCommonProps = () => {

  return {
    colorMode: 'light',
    highlightColor: '#eaeaea',
    transition: {
      type: 'timing',
      duration: 1300,
    },
    backgroundColor: '#f1f3f4',
  } as const;
  
};

export const useSkeletonCommonPropsDark = () => {

  return {
    colorMode: 'dark',
    highlightColor: '#2a2a2a',
    transition: {
      type: 'timing',
      duration: 1300,
    },
    backgroundColor: '#2a2a2a',
  } as const;
  
};

