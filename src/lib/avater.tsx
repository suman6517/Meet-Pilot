import { createAvatar } from "@dicebear/core";
import { botttsNeutral , initials } from "@dicebear/collection";


interface Props {
    seed:string;
    varriant: "botttsNeutral" | "initials";
}

export const generateAvaterUri = ({seed , varriant} : Props) =>
{
    let avatar;

    if(varriant === "botttsNeutral")
    {
        avatar = createAvatar(botttsNeutral , {seed});
    }
    else
    {
        avatar = createAvatar(initials , {seed , fontWeight:500 , fontSize:42});
    }

    return avatar.toDataUri();
};