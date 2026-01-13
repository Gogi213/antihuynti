using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using System.Net;

// We will use simple string parsing to avoid complex dependencies for JSON
public class AntigravityTray : Form
{
    private NotifyIcon trayIcon;
    private ContextMenu contextMenu;
    private MenuItem primaryItem;
    private MenuItem secondaryItem;
    private Process managerProcess;
    private Timer statusTimer;
    private bool isExiting = false;

    public AntigravityTray()
    {
        // Hide the form
        this.ShowInTaskbar = false;
        this.WindowState = FormWindowState.Minimized;
        this.Load += (s, e) => this.Hide();

        // Initialize components
        contextMenu = new ContextMenu();
        
        primaryItem = new MenuItem("Primary: Checking...", (s, e) => Action("primary", "login"));
        secondaryItem = new MenuItem("Secondary: Checking...", (s, e) => Action("secondary", "login"));
        
        contextMenu.MenuItems.Add("Antigravity Round Robin Proxy");
        contextMenu.MenuItems.Add("-");
        contextMenu.MenuItems.Add(primaryItem);
        contextMenu.MenuItems.Add(secondaryItem);
        contextMenu.MenuItems.Add("-");
        contextMenu.MenuItems.Add("Open Dashboard (Web)", (s, e) => Process.Start("http://localhost:8320"));
        contextMenu.MenuItems.Add("Exit", OnExit);

        trayIcon = new NotifyIcon();
        trayIcon.Text = "Antigravity Proxy";
        // Convert a standard icon or create one
        trayIcon.Icon = SystemIcons.Application; 
        trayIcon.ContextMenu = contextMenu;
        trayIcon.Visible = true;

        // Start Node Manager
        StartManager();

        // Status Timer
        statusTimer = new Timer();
        statusTimer.Interval = 2000;
        statusTimer.Tick += (s, e) => CheckStatus();
        statusTimer.Start();
    }

    private void StartManager()
    {
        try
        {
            ProcessStartInfo startInfo = new ProcessStartInfo();
            startInfo.FileName = "node";
            startInfo.Arguments = "manager.js";
            startInfo.WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory + @"\AntigravityManager";
            startInfo.WindowStyle = ProcessWindowStyle.Hidden;
            startInfo.CreateNoWindow = true;
            startInfo.UseShellExecute = false;
            
            managerProcess = Process.Start(startInfo);
        }
        catch (Exception ex)
        {
            MessageBox.Show("Failed to start manager.js: " + ex.Message);
        }
    }

    private void CheckStatus()
    {
        try
        {
            using (var client = new System.Net.WebClient())
            {
                string json = client.DownloadString("http://localhost:8320/api/status");
                // JSON structure: 
                // { 
                //   "primary": { "active": true, "user": "antigravity-xyz.json" }, 
                //   "secondary": { "active": false, "user": null } 
                // }
                
                bool pActive = json.Contains("\"primary\":{\"active\":true");
                bool sActive = json.Contains("\"secondary\":{\"active\":true");
                
                string pUser = ParseUser(json, "primary");
                string sUser = ParseUser(json, "secondary");

                UpdateItem(primaryItem, "Primary", pActive, pUser);
                UpdateItem(secondaryItem, "Secondary", sActive, sUser);
            }
        }
        catch
        {
            primaryItem.Text = "Primary: Disconnected";
            secondaryItem.Text = "Secondary: Disconnected";
        }
    }

    private string ParseUser(string json, string key) 
    {
        // quick hacky parser because we don't have JSON lib and structure is expected
        // look for "primary":{... "user":"VALUE" ...}
        // or "primary":{... "user":null ...}
        
        try 
        {
            int keyIndex = json.IndexOf("\"" + key + "\"");
            if (keyIndex == -1) return null;
            
            int userIndex = json.IndexOf("\"user\":", keyIndex);
            if (userIndex == -1) return null;
            
            int startQuote = json.IndexOf("\"", userIndex + 7);
            if (startQuote == -1) return null; // likely null
            
            // Check if it's null before the quote (e.g. "user":null)
            string nearUser = json.Substring(userIndex, 12); // "user":null ?
            if (nearUser.Contains("null")) return null;

            int endQuote = json.IndexOf("\"", startQuote + 1);
            if (endQuote == -1) return null;
            
            string raw = json.Substring(startQuote + 1, endQuote - startQuote - 1);
            // Format: antigravity-email_com.json
            return raw.Replace("antigravity-", "").Replace(".json", "").Replace("_", ".").Replace(".com", "@gmail.com");
        } 
        catch 
        { 
            return null; 
        }
    }

    private void UpdateItem(MenuItem item, string name, bool active, string user)
    {
        string status = active ? "[ON]" : "[OFF]";
        string displayUser = String.IsNullOrEmpty(user) ? "Not Login" : user;
        
        if (active && !String.IsNullOrEmpty(user)) 
        {
             item.Text = String.Format("{0}: {1} ({2})", name, status, displayUser);
        }
        else
        {
             item.Text = String.Format("{0}: {1} - Click to Login", name, status);
        }
        
        item.Checked = active;
    }

    private void Action(string id, string act)
    {
        try 
        {
            using (var client = new System.Net.WebClient())
            {
                client.Headers[System.Net.HttpRequestHeader.ContentType] = "application/json";
                string data = String.Format("{{\"id\":\"{0}\",\"action\":\"{1}\"}}", id, act);
                client.UploadString("http://localhost:8320/api/action", "POST", data);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show("Action failed: " + ex.Message);
        }
    }

    private void OnExit(object sender, EventArgs e)
    {
        isExiting = true;
        trayIcon.Visible = false;
        
        if (managerProcess != null && !managerProcess.HasExited)
        {
            managerProcess.Kill();
        }

        Application.Exit();
    }

    protected override void SetVisibleCore(bool value)
    {
        base.SetVisibleCore(isExiting ? value : false);
    }

    [STAThread]
    static void Main()
    {
        Application.Run(new AntigravityTray());
    }
}
