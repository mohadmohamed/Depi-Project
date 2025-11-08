using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.DTOs
{
    public class userAnswersDTO
    {
        public int sessionid { get; set; }                    
        public List<string> Answers { get; set; } = new(); 
    }
}
