import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    // App is ready

    // ini adonisjs5-scheduler, kalo gabisa ganti ke node-cron, trus panggil langsung disini
    const scheduler = this.app.container.use('Adonis/Addons/Scheduler')
    scheduler.run()
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
