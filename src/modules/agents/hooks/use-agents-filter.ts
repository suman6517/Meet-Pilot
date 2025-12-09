import { DEFAULT_PAGE } from "@/constants"
import {parseAsInteger , parseAsString , useQueryStates} from "nuqs"

export const useAgentFilers = () =>{
    return useQueryStates({
        search:parseAsString.withDefault("").withOptions({clearOnDefault:true}),
        page:parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({clearOnDefault:true}),
    })
};

// Nuqs sync the search params with use state 