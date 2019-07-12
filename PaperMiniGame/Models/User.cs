using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PaperMiniGame.Models
{
    public class User
    {
        public string ConnectionId { get; set; }
        public string Name { get; set; }
        public bool InRoom { get; set; }
    }
}