import {z} from "zod"

export const SendMessageValdator = z.object({
    fileId:z.string(),
    message:z.string()
})