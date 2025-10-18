
namespace DEPI.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            // Configure CORS for the React client
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactClientPolicy", policy =>
                {
                    policy.WithOrigins("http://localhost:5173") // React dev server origin
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Enable CORS for React client
            app.UseCors("ReactClientPolicy");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
