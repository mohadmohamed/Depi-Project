using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.Contracts
{
    public interface IJwtService
    {
        public string GenerateToken();
    }
}
