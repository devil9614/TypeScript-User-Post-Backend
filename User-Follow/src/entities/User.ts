import { Field, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt:  Date;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Field()
    @Column( {nullable: true} )
    followers: string;
    // followers: [{username: String}];

    @Field()
    @Column( {nullable: true} )
    following: string;
    // following: [{username: String}];

}