using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.Application.Services;
using DEPI.DataAccess.Entites;
using Microsoft.Extensions.DependencyInjection;

namespace DEPI.Application
{
    public static class ApplicationExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IUserService , UserService>();
            services.AddScoped<JwtService>();

            return services;
        }
    }
}
