import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

export class AuthResponseDto {
    @ApiProperty({
        description: "Access token for authentication",
        example: "fhdhueeKDHDhflkslhfjdlhjfDDUDLEIkdduelhfhhfeihfLJFDHLIDDKFLljgffhdDJGDHSDHDRUSdkjdgksddhj"
    })
    accessToken: string;
    @ApiProperty({
        description: "Refresh token for obtaining new access tokens",
        example: "mddnsiKDNDkdkfpKFFfkjfsFJJFJfjieKFJEUMlfddKFDKJDKfjdk"
    })
    refreshToken: string;
    @ApiProperty({
        description: 'Authenticated user information',
        example: {
            id: "user-123",
            email: '<EMAIL>',
            firstName: 'Jhon',
            lastName: "Doe",
            role: 'USER'
        }
    })
    user: {
        id: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        role: Role;
    };
}