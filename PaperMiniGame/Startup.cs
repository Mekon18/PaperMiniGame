using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(PaperMiniGame.Startup))]
namespace PaperMiniGame
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
            ConfigureAuth(app);
        }
    }
}
