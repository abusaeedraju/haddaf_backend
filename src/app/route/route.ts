import { Router } from "express"
import { userRoutes } from "../modules/user/user.routes"
import { authRoutes } from "../modules/auth/auth.routes"
import { groundRoutes } from "../modules/ground/ground.route"
import { bookingRoutes } from "../modules/booking/booking.route"
import { reviewRoutes } from "../modules/review/review.routes"
import { eventRoutes } from "../modules/event/event.route"
import { NotificationsRouters } from "../modules/notifications/notification.routes"

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
    },
    {
        path: "/booking",
        component: bookingRoutes
    },
    {
        path: "/review",
        component: reviewRoutes
    },
    {
        path: "/event",
        component: eventRoutes
    },
    {
        path: "/notification",
        component: NotificationsRouters
    }
]

routes.forEach(route => router.use(route.path, route.component))
export default router 