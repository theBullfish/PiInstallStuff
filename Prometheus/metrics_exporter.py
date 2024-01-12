from prometheus_client import start_http_server, Gauge
import psutil
import time

# Create Prometheus gauges to track system metrics
cpu_usage = Gauge('cpu_usage', 'CPU usage percentage')
memory_usage = Gauge('memory_usage', 'Memory usage percentage')
disk_usage = Gauge('disk_usage', 'Disk usage percentage')

# Additional metrics
network_sent = Gauge('network_sent', 'Bytes sent over network')
network_recv = Gauge('network_recv', 'Bytes received over network')
cpu_temp = Gauge('cpu_temperature', 'CPU temperature')
swap_usage = Gauge('swap_usage', 'Swap usage percentage')

def gather_metrics():
    """Gather system metrics and update Prometheus gauges."""
    cpu_usage.set(psutil.cpu_percent(interval=None))
    memory = psutil.virtual_memory()
    memory_usage.set(memory.percent)
    disk = psutil.disk_usage('/')
    disk_usage.set(disk.percent)

    net_io = psutil.net_io_counters()
    network_sent.set(net_io.bytes_sent)
    network_recv.set(net_io.bytes_recv)

    # Assuming you have a method to get CPU temperature
    # cpu_temp.set(get_cpu_temperature())

    swap = psutil.swap_memory()
    swap_usage.set(swap.percent)

def get_cpu_temperature():
    """Get the CPU temperature."""
    # This function needs to be implemented based on your specific hardware and setup.
    # For Raspberry Pi, you can use the vcgencmd command, for example.
    try:
        temp = psutil.sensors_temperatures().get('cpu-thermal', [])[0].current
        return temp
    except:
        return 0  # Return 0 or some default value if unable to get temperature

if __name__ == '__main__':
    # Start up the server to expose the metrics.
    start_http_server(8000)  # Expose on port 8000
    while True:
        gather_metrics()
        time.sleep(30)  # Update metrics every 30 seconds
