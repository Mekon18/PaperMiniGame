using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace PaperMiniGame.Models
{
    public class RoomHub : Hub
    {
        static List<User> Users = new List<User>();
        static List<User[]> Rooms = new List<User[]>();

        // Отправка сообщений
        public void Send(string name, string message)
        {
            Clients.All.addMessage(name, message);
        }

        // Подключение нового пользователя
        public void Connect(string userName)
        {
            var id = Context.ConnectionId;


            if (!Users.Any(x => x.ConnectionId == id))
            {
                Users.Add(new User { ConnectionId = id, Name = userName });
                var waiting = Users.Where(x => x.InRoom == false).ToArray();
                if (waiting.Count() >= 2)
                {
                    waiting[0].InRoom = true;
                    waiting[1].InRoom = true;
                    Rooms.Add(new[] { waiting[0], waiting[1] });


                }
                // Посылаем сообщение текущему пользователю
                Clients.Caller.onConnected(id, userName, Users);

            }
        }

        // Отключение пользователя
        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            var item = Users.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (item != null)
            {
                Users.Remove(item);
                var id = Context.ConnectionId;
                Clients.All.onUserDisconnected(id, item.Name);
            }

            return base.OnDisconnected(stopCalled);
        }
    }
}