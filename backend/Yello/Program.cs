using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<BoardService>();
builder.Services.AddScoped<ListService>();
builder.Services.AddScoped<CardService>();
builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<LabelService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

// Seed temporaire : un utilisateur de dev pour tester avant l'étape JWT
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Users.Any())
    {
        db.Users.Add(new Yello.Entities.User
        {
            Username = "dev",
            Email = "dev@yello.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("dev")
        });
        db.SaveChanges();
    }
}

app.Run();
