declare module 'darkforest-blocker' {
  interface BlockerOptions {
      blockedUserAgents: string[];
      redirectUrl?: string | null;
      statusCode?: number;
  }

  interface RequestLike {
      headers: Record<string, string | undefined>;
  }

  interface ResponseLike {
      status: (code: number) => ResponseLike;
      json: (body: any) => void;
      redirect: (url: string) => void;
  }

  type NextFunction = () => void;

  function darkforestblocker(
      options?: BlockerOptions
  ): (req: RequestLike, res: ResponseLike, next: NextFunction) => void;

  export default darkforestblocker;
}