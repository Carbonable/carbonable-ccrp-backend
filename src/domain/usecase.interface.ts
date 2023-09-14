export interface UseCaseInterface<Request, Response> {
    execute(request: Request): Promise<Response>;    
}