var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add CORS policy for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDev",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

builder.Services.AddControllersWithViews()
    .AddRazorRuntimeCompilation(); 


var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}


app.UseHttpsRedirection();

// Use CORS before routing
app.UseCors("AllowReactDev");

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.UseDefaultFiles();   // looks for index.html
app.UseStaticFiles();

app.MapControllers();

app.MapFallbackToFile("index.html"); // ✅ serve React SPA for unknown routes

app.Run();

// To build and run the application, use the following commands in the terminal:
// dotnet clean
// dotnet build
// dotnet run
