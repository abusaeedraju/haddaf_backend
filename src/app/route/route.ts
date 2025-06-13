import { Router } from "express"
import { userRoutes } from "../modules/user/user.routes"
import { authRoutes } from "../modules/auth/auth.routes"
import { groundRoutes } from "../modules/ground/ground.route"

const router = Router()
const routes = [
    {
        path: "/user",
        component: userRoutes
    },
    {
        path: "/auth",
        component: authRoutes
    },
    {
        path: "/ground",
        component: groundRoutes
    }
]

routes.forEach(route => router.use(route.path, route.component))
export default router 