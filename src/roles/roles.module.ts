import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/roles.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
    ],
    exports: [RolesService],
    providers: [RolesService],
    controllers: [RolesController],
})
export class RolesModule {}
