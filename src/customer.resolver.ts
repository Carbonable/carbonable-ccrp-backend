import { Args, Query, Resolver } from "@nestjs/graphql";

@Resolver('Customer')
export class CustomerResolver {
    @Query()
    async customer(@Args('id') id: string): Promise<string> {
        console.log(id);
        return "John Doe";
    }
}
