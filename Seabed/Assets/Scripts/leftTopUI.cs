using UnityEngine;
using System.Collections;

public class leftTopUI : MonoBehaviour {
	
	public GUIStyle guiTime; 
	public GUIStyle guiSlider; 
	public GUIStyle guiCount;
    public GUIStyle guiThumb;
    public GUISkin skin;
	public float fValue=1.0F; //第几关
	public float fCount=0.0F;// 鱼的数量  最大为5 最小为0
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	void OnGUI()
	{
		//string totalTime=Time.time.ToString();
        GUI.skin = skin;
		int t= (int)Mathf.Floor(Time.time);
		int  hour=(int)(t/3600);
		string hourStr=string.Format("{0:D2}", hour);
		string minStr=string.Format("{0:D2}",(int)(t-hour*3600)/60);
		string secStr=string.Format("{0:D2}",(int)(t%3600%60));
		GUI.Label(new Rect(10,10,60,30),hourStr+":"+minStr+":"+secStr,guiTime);
		fCount= GUI.HorizontalSlider(new Rect(10,40,60,30),(float)fCount,1.0f,3.0f);
		if(fCount<0)
		{
			fCount=0;
		}
		if(fCount>5)
		{
			fCount=5;
		}
        if (fValue == 1)
        {
            GUI.Label(new Rect(10, 70, 60, 20), "task:the fish count:" + "(" + fCount + ")", guiCount);
        }
		
		
	}
}
