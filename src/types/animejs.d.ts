declare module 'animejs' {
  interface AnimeParams {
    targets?: any;
    duration?: number;
    delay?: number | ((el: any, i: number) => number);
    easing?: string;
    opacity?: number | number[];
    translateY?: number | number[];
    translateX?: number | number[];
    direction?: string;
    loop?: boolean | number;
    complete?: () => void;
    [key: string]: any;
  }

  interface AnimeTimelineInstance {
    add(params: AnimeParams, offset?: string | number): AnimeTimelineInstance;
  }

  interface AnimeInstance {
    play(): void;
    pause(): void;
    restart(): void;
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance;
    timeline(params?: AnimeParams): AnimeTimelineInstance;
    stagger(
      value: number,
      options?: { start?: number; from?: string | number },
    ): (el: any, i: number) => number;
  }

  const anime: AnimeStatic;
  export default anime;
}
