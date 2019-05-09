using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Integration.AspNet.Core;

namespace Server.Controllers
{
    [Route("api/messages")]
    [ApiController]
    public class BotController : Controller
    {
        private readonly IBotFrameworkHttpAdapter Adapter;
        private readonly IBot Bot;

        public BotController(IBotFrameworkHttpAdapter adapter, IBot bot)
        {
            Adapter = adapter;
            Bot = bot;
        }

        [HttpPost, HttpGet]
        public async Task Index()
        {
            await Adapter.ProcessAsync(Request, Response, Bot);
        }
    }
}