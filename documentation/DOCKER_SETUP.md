# Docker Setup for Local Supabase Development

## Install Docker Desktop

### macOS
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install the `.dmg` file
3. Open Docker Desktop from Applications
4. Wait for Docker to start (whale icon in menu bar should be steady)

### Verify Installation
```bash
docker --version
docker ps
```

## Start Supabase After Docker is Running

```bash
supabase start
```

This will:
- Download required Docker images (first time only, ~1-2GB)
- Start PostgreSQL, PostgREST, Storage, etc.
- Create local database
- Print connection details

## Common Issues

### "Cannot connect to Docker daemon"
- **Solution:** Open Docker Desktop and wait for it to fully start
- Check Docker is running: `docker ps` should work without errors

### "Port already in use"
- **Solution:** Stop existing containers: `supabase stop`
- Or check what's using the port: `lsof -i :54322`

### Docker Desktop won't start
- Check system requirements (macOS 10.15+)
- Ensure virtualization is enabled in BIOS (if on Windows/Linux)
- Try restarting Docker Desktop
