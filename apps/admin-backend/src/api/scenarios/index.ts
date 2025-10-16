import { Hono } from 'hono'
import compileRoute from './compile.route.js'
import publishRoute from './publish.route.js'
import validateRoute from './validate.route.js'
import getRoute from './get.route.js'

const app = new Hono()

// Mount routes
app.route('/compile', compileRoute)
app.route('/publish', publishRoute)
app.route('/validate', validateRoute)
app.route('/', getRoute)

export default app
