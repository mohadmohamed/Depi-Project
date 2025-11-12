using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.DTOs
{
    public class GenerateQuizDTO
    {
        public int userid { get; set; }
        public int resmueid { get; set; }
        public string targetJob { get; set; }
    }
}
