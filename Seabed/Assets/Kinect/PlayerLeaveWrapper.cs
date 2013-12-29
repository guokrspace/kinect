using UnityEngine;
using System.Collections;

public class PlayerLeaveWrapper : MonoBehaviour {
	
	[HideInInspector]
	public bool binPlayerLeave = false;
	
	//提示框布局
	private const int p_nLeft = 100;
	private const int p_nTop = 100;
	private const int p_nWidth = 1024-100*2;
	private const int p_nHeight = 768-100*2;
	
	// Use this for initialization
	void Start () {
		
		binPlayerLeave = false;
		//提示框布局
		//binPlayerLeave = false;
	}
	void OnGUI(){
		Rect restMessgae = new Rect();
		restMessgae.Set(p_nLeft, p_nTop, p_nWidth, p_nHeight);
		if(binPlayerLeave == true)
		{
			GUI.Box(restMessgae,"please back");
		}
	}
	// Update is called once per frame
	void Update () {
	
	}
}
