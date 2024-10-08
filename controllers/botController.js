class BotContoller {
  constructor(botService) {
    this.botService = botService;
  }

  async getBot(req, res) {
    const bot = await this.botService.getBot();
    res.status(200).json(bot);
  }

  async createBot(req, res) {
    const bot = await this.botService.createBot(req.body);
    res.status(201).json(bot);
  }

  async updateBot(req, res) {
    const bot = await this.botService.updateBot(req.params.id, req.body);
    res.status(200).json(bot);
  }

  async deleteBot(req, res) {
    await this.botService.deleteBot(req.params.id);
    res.status(204).end();
  }
}
